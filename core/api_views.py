from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Member, Savings, Loan, Repayment
from .serializers import (
    MemberSerializer,
    SavingsSerializer,
    LoanSerializer,
    RepaymentSerializer,
)


def _member_summary(member):
    savings_qs = Savings.objects.filter(member=member).order_by('-id')
    loans_qs = Loan.objects.filter(member=member).order_by('-id')
    loan_ids = list(loans_qs.values_list('id', flat=True))
    repayments_qs = Repayment.objects.filter(loan_id__in=loan_ids).order_by('-id')

    return {
        'member': {
            'id': member.id,
            'full_name': member.full_name,
            'phone': member.phone,
            'email': member.email,
            'address': member.address,
            'national_id': member.national_id,
            'registration_date': member.registration_date,
        },
        'savings': list(savings_qs.values('id', 'amount', 'deposit_date')),
        'loans': list(
            loans_qs.values('id', 'amount', 'interest_rate', 'duration', 'application_date', 'status')
        ),
        'repayments': [
            {
                'id': r.id,
                'loanId': r.loan_id,
                'amount_paid': str(r.amount_paid),
                'payment_date': r.payment_date,
            }
            for r in repayments_qs
        ],
    }



@method_decorator(csrf_exempt, name='dispatch')
class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [AllowAny]



@method_decorator(csrf_exempt, name='dispatch')
class SavingsViewSet(viewsets.ModelViewSet):
    queryset = Savings.objects.all()
    serializer_class = SavingsSerializer
    permission_classes = [AllowAny]



@method_decorator(csrf_exempt, name='dispatch')
class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [AllowAny]



@method_decorator(csrf_exempt, name='dispatch')
class RepaymentViewSet(viewsets.ModelViewSet):
    queryset = Repayment.objects.all()
    serializer_class = RepaymentSerializer
    permission_classes = [AllowAny]




@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):

    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'is_admin': user.is_staff or user.is_superuser,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })





@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_api(request):

    logout(request)
    return Response({'detail': 'Logged out successfully.'})


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):

    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    user = authenticate(request, username=username, password=password)
    if user is None:
        return Response({'detail': 'Invalid username or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    return Response({
        'id': user.id,
        'username': user.username,
        'is_admin': user.is_staff or user.is_superuser,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
    })



@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def member_summary_api(request):
    phone = (request.data.get('phone') or '').strip()
    if not phone:
        return Response({'detail': 'Phone is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        member = Member.objects.get(phone=phone)
    except Member.DoesNotExist:
        return Response({'detail': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)

    return Response(_member_summary(member), status=status.HTTP_200_OK)

