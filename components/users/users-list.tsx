"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreVertical, UserPlus, Check, X, Edit, Trash2 } from "lucide-react"

const mockUsers = [
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@universidad.edu",
    role: "STUDENT",
    status: "APPROVED",
    avatar: "/portrait-thoughtful-woman.png",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@universidad.edu",
    role: "STUDENT",
    status: "PENDING",
    avatar: "/portrait-carlos.png",
    joinDate: "2024-03-10",
  },
  {
    id: "3",
    name: "Ana Martínez",
    email: "ana.martinez@universidad.edu",
    role: "TUTOR",
    status: "APPROVED",
    avatar: "/ana-abstract-geometric.png",
    joinDate: "2023-09-05",
  },
  {
    id: "4",
    name: "Luis Hernández",
    email: "luis.hernandez@universidad.edu",
    role: "STUDENT",
    status: "REJECTED",
    avatar: "/luis.jpg",
    joinDate: "2024-02-20",
  },
  {
    id: "5",
    name: "Sofia Pérez",
    email: "sofia.perez@universidad.edu",
    role: "STUDENT",
    status: "APPROVED",
    avatar: "/sofia.jpg",
    joinDate: "2024-01-25",
  },
]

export function UsersList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [users, setUsers] = useState(mockUsers)

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleApprove = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "APPROVED" } : u)))
  }

  const handleReject = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: "REJECTED" } : u)))
  }

  const handleDelete = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: "bg-green-100 text-green-700 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      REJECTED: "bg-red-100 text-red-700 border-red-200",
    }
    const labels = {
      APPROVED: "Aprobado",
      PENDING: "Pendiente",
      REJECTED: "Rechazado",
    }
    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      STUDENT: "bg-blue-100 text-blue-700 border-blue-200",
      TUTOR: "bg-purple-100 text-purple-700 border-purple-200",
      ADMIN: "bg-orange-100 text-orange-700 border-orange-200",
    }
    const labels = {
      STUDENT: "Estudiante",
      TUTOR: "Tutor",
      ADMIN: "Administrador",
    }
    return (
      <Badge variant="outline" className={styles[role as keyof typeof styles]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">Administra los usuarios del sistema y sus permisos</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Agregar Usuario
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="STUDENT">Estudiantes</SelectItem>
              <SelectItem value="TUTOR">Tutores</SelectItem>
              <SelectItem value="ADMIN">Administradores</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="APPROVED">Aprobados</SelectItem>
              <SelectItem value="PENDING">Pendientes</SelectItem>
              <SelectItem value="REJECTED">Rechazados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(user.joinDate).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {user.status === "PENDING" && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                              <Check className="w-4 h-4 mr-2" />
                              Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(user.id)}>
                              <X className="w-4 h-4 mr-2" />
                              Rechazar
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
