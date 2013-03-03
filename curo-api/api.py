from tastypie import fields
from tastypie.resources import ModelResource, ALL
from tastypie.authorization import Authorization
from tastypie.utils.urls import trailing_slash
from django.conf.urls.defaults import patterns, url
from models import Transaction, Category, Entity, File

class CategoryResource(ModelResource):
    parent = fields.ForeignKey('Curo.curo-api.api.CategoryResource', 'parent', null=True)

    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/(?P<pk>\w[\w/-]*)/children%s$" % (self._meta.resource_name, trailing_slash())
                , self.wrap_view('get_children'), name="api_get_children"),
        ]

    def get_children(self, request, **kwargs):
        print kwargs
        try:
            obj = self.cached_obj_get(request=request, **self.remove_api_resource_names(kwargs))
        except ObjectDoesNotExist:
            return HttpGone()
        except MultipleObjectsReturned:
            return HttpMultipleChoices("More than one resource is found at this URI.")

        child_resource = CategoryResource()
        return child_resource.get_list(request, parent=obj.pk)

    class Meta:
        queryset = Category.objects.all()
        resource_name = 'category'
        authorization = Authorization()
        filtering = {
            'parent': ALL,
            'name': ALL
        }

class EntityResource(ModelResource):
    class Meta:
        queryset = Entity.objects.all()
        resource_name = 'entity'
        authorization = Authorization()

class FileResource(ModelResource):
    class Meta:
        queryset = File.objects.all()
        resource_name = 'file'
        authorization = Authorization()

class TransactionResource(ModelResource):

    category     = fields.ForeignKey(CategoryResource, 'category')
    entity       = fields.ForeignKey(EntityResource, 'entity')
    files        = fields.ToManyField(FileResource, 'files')
    transactions = fields.ToManyField(FileResource, 'transactions')

    class Meta:
        queryset = Transaction.objects.all()
        resource_name = 'transaction'
        authorization = Authorization()
        filtering = {
            'order_date': ALL,
        }

