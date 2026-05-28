"""
Emissions app — custom DRF permissions.

Provides organization-level tenant isolation for multi-tenancy.
"""

from rest_framework.permissions import BasePermission


class IsOrganizationMember(BasePermission):
    """
    Restrict access to records belonging to the user's organization.

    For the prototype, this is a pass-through (all access allowed)
    since authentication is not yet implemented. When auth is added,
    this should check ``request.user.organization`` against the
    object's ``organization`` field.
    """

    message = "You do not have access to this organization's data."

    def has_permission(self, request, view):
        # Prototype: allow all access
        return True

    def has_object_permission(self, request, view, obj):
        # When auth is implemented, check:
        # return obj.organization == request.user.organization
        return True


class IsAdminOrAnalyst(BasePermission):
    """
    Allow access only to users belonging to Admin or Analyst groups, or superusers.
    """

    message = "Only Admins or Analysts are permitted to perform this action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        user_groups = request.user.groups.values_list("name", flat=True)
        return "Admin" in user_groups or "Analyst" in user_groups
