from rest_framework.routers import DefaultRouter
from .api_views import (
    MemberViewSet,
    SavingsViewSet,
    LoanViewSet,
    RepaymentViewSet,
)

router = DefaultRouter()

router.register(r'members', MemberViewSet)
router.register(r'savings', SavingsViewSet)
router.register(r'loans', LoanViewSet)
router.register(r'repayments', RepaymentViewSet)

urlpatterns = router.urls