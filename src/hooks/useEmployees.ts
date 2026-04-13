import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Employee } from '../types'

export function useEmployees() {
  const { propertyId, properties } = useAuth()
  const queryClient = useQueryClient()

  const currentProperty = properties.find(p => p.id === propertyId)
  const ownerId = currentProperty?.user_id

  // 1. Fetch Employees with Occurrence Counts
  const query = useQuery({
    queryKey: ['employees', propertyId],
    queryFn: async () => {
      if (!propertyId) return []

      // Fetch employees
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('property_id', propertyId)
        .order('name', { ascending: true })

      if (empError) throw empError

      // Fetch action counts (occurrences registered by each employee)
      const { data: counts, error: countError } = await supabase
        .from('occurrences')
        .select('employee_id')
        .eq('property_id', propertyId)

      if (countError) throw countError

      // Map counts to employees
      const actionMap = (counts || []).reduce((acc: any, curr: any) => {
        if (curr.employee_id) {
          acc[curr.employee_id] = (acc[curr.employee_id] || 0) + 1
        }
        return acc
      }, {})

      return (employees || []).map(emp => ({
        ...emp,
        action_count: actionMap[emp.id] || 0
      })) as (Employee & { action_count: number })[]
    },
    enabled: !!propertyId
  })

  // 2. Fetch Available Roles
  const rolesQuery = useQuery({
    queryKey: ['roles', ownerId],
    queryFn: async () => {
      if (!ownerId) return []
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('owner_id', ownerId)
        .order('name')
      
      if (error) throw error
      return data
    },
    enabled: !!ownerId
  })

  // 3. Mutation: Invite Employee
  const inviteMutation = useMutation({
    mutationFn: async ({ name, email, roleId, roleName, phone }: { name: string, email: string, roleId?: string, roleName?: string, phone?: string }) => {
      if (!propertyId) throw new Error('Propriedade não selecionada')

      // A. Create Employee Record
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .insert({
          name,
          email,
          role: roleName,
          role_id: roleId,
          phone,
          property_id: propertyId,
          active: true,
          invite_status: 'pending'
        })
        .select()
        .single()

      if (empError) throw empError

      // B. Create Invite Record
      const { error: inviteError } = await supabase
        .from('invites')
        .insert({
          employee_id: employee.id,
          invited_email: email,
          status: 'pending',
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })

      if (inviteError) throw inviteError

      // C. Trigger Edge Function
      const { error: funcError } = await supabase.functions.invoke('send-invite')
      if (funcError) console.warn('Falha ao disparar Edge Function:', funcError)

      return employee
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })

  // 4. Mutation: Resend Invite
  const resendMutation = useMutation({
    mutationFn: async (employee: any) => {
      // Reset invite status
      const { error: inviteError } = await supabase
        .from('invites')
        .update({ status: 'pending', sent_at: null })
        .eq('employee_id', employee.id)
      
      if (inviteError) throw inviteError

      // Invoke Edge Function
      const { error: funcError } = await supabase.functions.invoke('send-invite')
      if (funcError) throw funcError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string, active: boolean }) => {
      const { error } = await supabase
        .from('employees')
        .update({ active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    }
  })

  return {
    ...query,
    roles: rolesQuery.data || [],
    isLoadingRoles: rolesQuery.isLoading,
    inviteEmployee: inviteMutation.mutateAsync,
    isInviting: inviteMutation.isPending,
    resendInvite: resendMutation.mutateAsync,
    isResending: resendMutation.isPending,
    deleteEmployee: deleteMutation.mutate,
    toggleStatus: toggleStatusMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isToggling: toggleStatusMutation.isPending
  }
}
