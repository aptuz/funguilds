from rest_framework import viewsets,status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

class CustomModelViewSet(viewsets.ModelViewSet):
    
    def get_serializer_class(self):
        serializer_class = self.parser['default']
        if getattr(self,'action') in self.parser:
            serializer_class = self.parser[getattr(self,'action')]
        if self.request.user.is_superuser:
            if 'admin_'+getattr(self,'action') in self.parser: 
                serializer_class = self.parser['admin_'+getattr(self,'action')]  
        return serializer_class
    
    def create(self, request, *args, **kwargs):
        data = request.DATA
        if hasattr(self, 'populate'):
            data = self.populate(request, request.DATA,'create')
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.object = serializer.save()
            if hasattr(self, 'post_save'):
                self.post_save(self.object, created=True)
            headers = self.get_success_headers(serializer.data)
            if request.accepted_renderer.format == 'json':
                return Response({'result':serializer.data,'lookup_field':self.lookup_field,'resource_uri':request.path+str(getattr(self.object,self.lookup_field))+'/'}, status=status.HTTP_201_CREATED,headers=headers)
            return Response(serializer.data, status=status.HTTP_201_CREATED,
            headers=headers)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data
        if hasattr(self, 'populate'):
            try:
                data = self.populate(request, request.data,'update')
            except:
                pass
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if hasattr(self, 'post_save'):
            self.post_save(instance, created=False)
        return Response(serializer.data)

    

    @csrf_exempt
    def dispatch(self, request, *args, **kwargs):
        """
        `.dispatch()` is pretty much the same as Django's regular dispatch,
        but with extra hooks for startup, finalize, and exception handling.
        """
        self.args = args
        self.kwargs = kwargs
        ###
        ### added in compatibility with lookup field
        if 'lookup' in kwargs:
            kwargs['lookup'] = int(kwargs['lookup'])
        ###
        request = self.initialize_request(request, *args, **kwargs)
        self.request = request
        self.headers = self.default_response_headers  # deprecate?

        try:
            self.initial(request, *args, **kwargs)

            # Get the appropriate handler method
            if request.method.lower() in self.http_method_names:
                handler = getattr(self, request.method.lower(),
                    self.http_method_not_allowed)
            else:
                handler = self.http_method_not_allowed

            response = handler(request, *args, **kwargs)

        except Exception as exc:
            response = self.handle_exception(exc)

        self.response = self.finalize_response(request, response, *args, **kwargs)
        return self.response