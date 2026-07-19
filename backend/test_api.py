import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as c:
        res = await c.post('http://localhost:8000/auth/login', data={'username': 'admin@example.com', 'password': 'Admin123!'})
        print("Login response:", res.json())
        token = res.json().get('access_token')
        users = await c.get('http://localhost:8000/users?limit=2', headers={'Authorization': f'Bearer {token}'})
        data = users.json()['data']
        for u in data:
            print(u['email'], "roles:", u.get('roles', []), "is_superuser:", u.get('is_superuser'))

asyncio.run(test())
