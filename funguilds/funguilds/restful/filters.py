from rest_framework.filters import BaseFilterBackend

class CustomFilterBackend(BaseFilterBackend):

    def filter_queryset(self, request, queryset, view):
        filter_fields = getattr(view, 'filter_fields', None)
        if filter_fields:
            return view.filtering(request.QUERY_PARAMS, queryset=queryset, user=request.user)
        return queryset
