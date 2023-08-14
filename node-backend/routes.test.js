import request from 'supertest';
import { app } from './src/server.js';

beforeAll(done => {
    done()
})

afterAll(done => {
    done()
})

describe('GET /login', () => {
    it('Handle missing data', async () => {
        const response = await request(app).get('/login').query({});
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Missing credentials");
    });

    it('Handle wrong credentials', async () => {
        const response = await request(app).get('/login').query({ email: 'admin', password: 'wrongpassword' });
        expect(response.status).toEqual(401);
        expect(response.body.result).toBe("Wrong credentials");
    });

    it('Handle correct credentials', async () => {
        const response = await request(app).get('/login').query({ email: 'admin', password: 'password' });
        expect(response.status).toBe(200);
        expect(response.body.result).toBe("Correct credentials");
    });

    it('Handle database not online', async () => {
        process.env.MONGODB_URI = 'mongodb://localhost:27018/nonexistingdb';
        const response = await request(app).get('/login').query({ email: 'admin', password: 'password' });
        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
    });
});
/*
describe('POST /register', () => {
    it('Handle user already exit ', async () => {
        const response = await request(app).post('/register').send({email: 'admin', password:'password',nomeAzienda: 'prova123',partitaIVA: 'AEI987'});

        expect(response.status).toBe(400);
        expect(response.body.result).toBe("User already exist, use another email");
    });
    it('Handle missing data', async () => {
        const response = await request(app).post('/register').send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Some parts of data are missing");
    });

    it('Handle correct request', async () => {
        const response = await request(app).post('/register').send({email: 'prova', password:'prova', nomeAzienda: 'prova123',partitaIVA: 'prova S.r.l'});

        expect(response.status).toBe(200);
        expect(response.body.result).toBe("User registered correctly");
    });

    it('Handle database not online', async () => {
        process.env.MONGODB_URI = 'mongodb://localhost:27018/nonexistingdb';
        const response = await request(app).post('/register').send({email: 'admin', password:'password', nomeAzienda: 'prova123',partitaIVA: 'AEI987'});

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
    });
});

describe('PUT /changePassword', () => {
    it('Handle unauthenticated user', async () => {
        const response = await request(app).put('/changePassword').send({email: 'admin', password:'password',newPassword: 'newPassword'});

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('User isn\'t authenticated');
    });
    it('Handle missing data', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({ email: 'admin', password: 'password' });

        const response = await agent.put('/changePassword').send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Some parts of data are missing");
    });

    it('Handle wrong credentials', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({ email: 'admin', password: 'password' });

        const response = await agent.put('/changePassword').send({email: 'admin', password: 'wrongpassword', newPassword: 'newpassword' });

        expect(response.status).toBe(404);
        expect(response.body.result).toBe("User not found");
    });

    it('Handle correct credentials', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({ email: 'admin', password: 'password' });

        const response = await agent.put('/changePassword').send({email: 'admin', password: 'password', newPassword: 'newpassword' });

        expect(response.status).toBe(200);
        expect(response.body.result).toBe("Password changed correctly");
    });

    it('Handle database not online', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({ email: 'admin', password: 'password' });

        process.env.MONGODB_URI = 'mongodb://localhost:27018/nonexistingdb';

        const response = await agent.put('/changePassword').send({email: 'admin', password: 'password', newPassword: 'newpassword' });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
    });
});

describe('DELETE /removeUser', () => {
    it('Handle unauthenticated user', async () => {
        const response = await request(app).delete('/removeUser').query({email: 'admin', password:'password'});

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('User isn\'t authenticated');
    });
    it('Handle missing data', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({email:'admin',password:'password'});

        const response = await agent.delete('/removeUser').query({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Some parts of data are missing");
    });

    it('Handle wrong credentials', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({ email: 'admin', password: 'password' });

        const response = await agent.delete('/removeUser').query({email: 'prova', password: 'provasbagliata'});

        expect(response.status).toBe(401);
        expect(response.body.result).toBe("User not found");
    });

    it('Handle correct credentials', async () => {
        const agent = request.agent(app);
        await agent.get('/login').query({ email: 'admin', password: 'password' });

        const response = await agent.delete('/removeUser').query({email: 'prova', password: 'prova'});

        expect(response.status).toBe(200);
        expect(response.body.result).toBe("User deleted correctly");
    });

    it('Handle database not online', async () => {
        const agent = request.agent(app);
        await agent.get('/login').send({ email: 'admin', password: 'password' });

        process.env.MONGODB_URI = 'mongodb://localhost:27018/nonexistingdb';

        const response = await agent.delete('/removeUser').query({email: 'prova', password: 'prova'});

        expect(response.status).toBe(500);
        expect(response.body.error).toBe("Internal Server Error");
    });
});
*/