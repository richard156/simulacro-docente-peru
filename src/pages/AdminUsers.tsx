import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Users,
  Search,
  Loader2,
  Shield,
  User as UserIcon,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { fetchAllProfiles, updateUserRole } from '@/lib/profileService'
import type { UserProfile } from '@/types'

export function AdminUsers() {
  const navigate = useNavigate()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadProfiles = useCallback(async () => {
    try {
      const data = await fetchAllProfiles()
      setProfiles(data)
    } catch (err) {
      toast.error('Error al cargar usuarios')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    setUpdatingId(userId)
    try {
      await updateUserRole(userId, newRole)
      toast.success(`Rol actualizado a ${newRole === 'admin' ? 'Administrador' : 'Usuario'}`)
      await loadProfiles()
    } catch (err) {
      toast.error('Error al actualizar el rol')
      console.error(err)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.region?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500 text-sm">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los roles y permisos de los usuarios registrados.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar usuarios por nombre, email, especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{profiles.length}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {profiles.filter(p => p.role === 'admin').length}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">
                {profiles.filter(p => !p.role || p.role === 'user').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {searchTerm
              ? 'No se encontraron usuarios con ese criterio de búsqueda.'
              : 'No hay usuarios registrados aún.'}
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Usuario
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      ID
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Especialidad
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Región
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Rol
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Registro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProfiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        updatingId === profile.id ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {profile.full_name || 'Sin nombre'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {profile.id ? profile.id.substring(0, 8) + '...' : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.specialty || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.region || '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={profile.role || 'user'}
                          onValueChange={(value: 'admin' | 'user') =>
                            handleRoleChange(profile.id, value)
                          }
                          disabled={updatingId === profile.id}
                        >
                          <SelectTrigger className="w-36 h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">
                              <span className="flex items-center gap-2">
                                <UserIcon className="h-3 w-3" />
                                Usuario
                              </span>
                            </SelectItem>
                            <SelectItem value="admin">
                              <span className="flex items-center gap-2">
                                <Shield className="h-3 w-3 text-primary" />
                                Admin
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.created_at
                          ? new Date(profile.created_at).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
