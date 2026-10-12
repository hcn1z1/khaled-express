from rest_framework import permissions

class IsStaffUser(permissions.BasePermission):
    """
    Allows access to Staff members: Moderator or Admin.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role in ['MODERATOR', 'ADMIN']
        )

class IsAdminUserOnly(permissions.BasePermission):
    """
    Allows access strictly to Admins (finance screens, fee modifications, expense entries).
    Moderators are explicitly denied.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ADMIN'
        )

class IsCustomerUser(permissions.BasePermission):
    """
    Allows access to customer users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'CUSTOMER'
        )
