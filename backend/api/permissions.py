from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to Admin role or superuser.
    Moderators and customers are denied.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'ADMIN' or request.user.is_superuser


class IsStaffOrAdmin(permissions.BasePermission):
    """
    Allows access to Staff (Moderator or Admin).
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role in ['ADMIN', 'MODERATOR'] or request.user.is_superuser


class CanAccessFinance(permissions.BasePermission):
    """
    Strict permission: Moderators cannot open finance screens, view payments/expenses,
    or edit fees/expenses. Only Admin has access.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'ADMIN' or request.user.is_superuser
