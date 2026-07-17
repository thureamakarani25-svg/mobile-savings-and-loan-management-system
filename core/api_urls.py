from django.urls import path
from rest_framework.routers import DefaultRouter
from .api_views import (
    MemberViewSet,
    SavingsViewSet,
    LoanViewSet,
    RepaymentViewSet,
    current_user,
    login_api,
    logout_api,
    member_summary_api,
)


router = DefaultRouter()

router.register(r'members', MemberViewSet)
router.register(r'savings', SavingsViewSet)
router.register(r'loans', LoanViewSet)
router.register(r'repayments', RepaymentViewSet)

urlpatterns = router.urls + [
    path('auth/me/', current_user, name='auth_me'),
    path('auth/login/', login_api, name='auth_login'),
    path('auth/logout/', logout_api, name='auth_logout'),
    path('auth/member_summary/', member_summary_api, name='member_summary'),
]
