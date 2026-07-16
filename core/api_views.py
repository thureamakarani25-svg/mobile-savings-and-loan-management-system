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


@method_decorator(csrf_exempt, name='dispatch')
class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]


@method_decorator(csrf_exempt, name='dispatch')
class SavingsViewSet(viewsets.ModelViewSet):
    queryset = Savings.objects.all()
    serializer_class = SavingsSerializer
    permission_classes = [IsAuthenticated]


@method_decorator(csrf_exempt, name='dispatch')
class LoanViewSet(viewsets.ModelViewSet):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]


@method_decorator(csrf_exempt, name='dispatch')
class RepaymentViewSet(viewsets.ModelViewSet):
    queryset = Repayment.objects.all()
    serializer_class = RepaymentSerializer
    permission_classes = [IsAuthenticated]


@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
@permission_classes([IsAuthenticated])
def logout_api(request):
    logout(request)
    return Response({'detail': 'Logged out successfully.'})