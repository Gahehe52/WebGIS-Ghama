from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nama: str

class Token(BaseModel):
    access_token: str
    token_type: str