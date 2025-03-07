import * as bcrypt from 'bcryptjs';
import { getRepository } from 'typeorm';
import { User } from '../users/user.model';
import db from '../_helpers/db';

export const userService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

// Function for getting all users
async function getAll(): Promise<User[]> {
    const userRepository = getRepository(User);
    return await userRepository.find();
}

// Function for getting user by ID
async function getById(id: number): Promise<User> {
    return await getUser(id);
}

// Function for getting user by ID with password hash //newlyadded
async function getByIdWithHash(id: number): Promise<User | null> {
    const userRepository = getRepository(User);
    return await userRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.id = :id', { id })
        .getOne();
}

// Function for creating and saving user
async function create(params: any): Promise<void> {
    const userRepository = getRepository(User);
    
    // Validate
    const existingUser = await userRepository.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const user = new User();
    Object.assign(user, params);

    // Hash password
    user.passwordHash = await bcrypt.hash(params.password, 10);

    // Save user
    await userRepository.save(user);
}

// Function for updating user by getting the ID
async function update(id: number, params: any): Promise<void> {
    const userRepository = getRepository(User);
    const user = await getUser(id);

    // Validate
    const usernameChanged = params.username && user.username !== params.username;
    if (usernameChanged) {
        const existingUser = await userRepository.findOne({ where: { username: params.username } });
        if (existingUser) {
            throw 'Username "' + params.username + '" is already taken';
        }
    }

    // Hash password if provided
    if (params.password) {
        params.passwordHash = await bcrypt.hash(params.password, 10);
    }

    // Copy params to user and save
    Object.assign(user, params);
    await userRepository.save(user);
}

// Deletes user by ID
async function _delete(id: number): Promise<void> {
    const userRepository = getRepository(User);
    const user = await getUser(id);
    await userRepository.remove(user);
}

// Helper function
async function getUser(id: number): Promise<User> {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ where: { id } });
    if (!user) throw 'User not found';
    return user;
}