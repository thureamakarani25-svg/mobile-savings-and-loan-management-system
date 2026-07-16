from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('admin-dashboard/', views.admin_dashboard_view, name='admin_dashboard'),
    path('member-dashboard/', views.member_dashboard_view, name='member_dashboard'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('member/', views.member_list, name='member_list_alias'),
    path('members/', views.member_list, name='member_list'),
    path('members/add/', views.add_member, name='add_member'),
    path('members/edit/<int:id>/', views.edit_member, name='edit_member'),
    path('members/delete/<int:id>/', views.delete_member, name='delete_member'),
]
