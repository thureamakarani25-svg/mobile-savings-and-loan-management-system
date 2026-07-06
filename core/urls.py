from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('member/', views.member_list, name='member_list_alias'),
    path('members/', views.member_list, name='member_list'),
    path('members/add/', views.add_member, name='add_member'),
    path('members/edit/<int:id>/', views.edit_member, name='edit_member'),
    path('members/delete/<int:id>/', views.delete_member, name='delete_member'),
]
