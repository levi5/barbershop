import bcrypt from 'bcrypt';
import { BcryptAdapter } from './bcrypt-adapter';

jest.mock('bcrypt', () => ({
	async hash ():Promise<string> {
		return new Promise(resolve => resolve('$2b$12$A7zJ8ca0KmcIk91Fi5Eqh'));
	}

}));

const salt = 12;

const makeSut = (): BcryptAdapter => {
	const salt = 12;
	return new BcryptAdapter(salt);
};
describe('Bcrypt Adapter', () => {
	test('Should call bcrypt with correct values', async () => {
		const sut = makeSut();
		const hashSpy = jest.spyOn(bcrypt, 'hash');
		await sut.encrypt('any_value');
		expect(hashSpy).toHaveBeenCalledWith('any_value', salt);
	});

	test('Should return hash on success', async () => {
		const sut = makeSut();
		const hash = await sut.encrypt('any_value');
		expect(hash).toBe('$2b$12$A7zJ8ca0KmcIk91Fi5Eqh');
	});
});
