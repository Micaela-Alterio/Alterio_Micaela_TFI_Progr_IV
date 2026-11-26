from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import MessageResponse, UserCreate, UserPublic
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserCreate,
    service: AuthService = Depends(get_auth_service),
) -> UserPublic:
    return service.register(user_data)


@router.post(
    "/token", response_model=MessageResponse, status_code=status.HTTP_200_OK
)
def login_for_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> MessageResponse:
    user = service.authenticate(
        identifier=form_data.username, password=form_data.password
    )

    access_token = create_access_token(
        data={"sub": user.username, "id": user.id, "role": user.role}
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )

    return MessageResponse(message="Login exitoso")


@router.post(
    "/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK
)
def logout(response: Response) -> MessageResponse:
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
    )
    return MessageResponse(message="Logout exitoso")


@router.get("/me", response_model=UserPublic, status_code=status.HTTP_200_OK)
def get_me(
    current_user: Usuario = Depends(get_current_active_user),
) -> UserPublic:
    return UserPublic.model_validate(current_user)
