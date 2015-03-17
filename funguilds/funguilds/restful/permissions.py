from rest_framework import permissions

class AdminCheckPermission(permissions.BasePermission):
    """
    Global permission check for admin.
    """

    def has_permission(self, request, view):
        if request.user.is_superuser:
        	return True
        else:
        	return False