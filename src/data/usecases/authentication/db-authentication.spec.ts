import { LoadAccountByEmailRepository } from '../../protocols/db/load-account-by-email-repository';
import { IAccountModel } from '../../../domain/model/account';
import { IAuthenticationModel } from '../../../domain/useCases/authentication';

import { DbAuthentication } from './db-authentication';
import { IHashComparer } from '../../protocols/cryptography/hash-comparer';

interface SutTypes {
    sut:DbAuthentication,
	loadAccountByEmailRepositoryStub:LoadAccountByEmailRepository
	hashComparerStub:IHashComparer
}

const makeFakeAccount = ():IAccountModel => (
	{
		id: 'any_id',
		name: 'any_name',
		email: 'any_email',
		password: 'hashed_password'
	}
);
const makeFakeAuthentication = ():IAuthenticationModel => (
	{
		email: 'any_mail@mail.com',
		password: 'any_password'
	}
);

const makeLoadAccountByEmailRepositoryStub = ():LoadAccountByEmailRepository => {
	class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
		async load (email:string):Promise<IAccountModel> {
			return new Promise(resolve => resolve(makeFakeAccount()));
		}
	}
	return new LoadAccountByEmailRepositoryStub();
};

const makeHashComparerStub = ():IHashComparer => {
	class HashComparerStub implements IHashComparer {
		async compare (value:string, hash:string):Promise<boolean> {
			return new Promise(resolve => resolve(true));
		}
	}
	return new HashComparerStub();
};

const makeSut = ():SutTypes => {
	const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub();
	const hashComparerStub = makeHashComparerStub();
	const sut = new DbAuthentication(hashComparerStub, loadAccountByEmailRepositoryStub);

	return {
		sut,
		loadAccountByEmailRepositoryStub,
		hashComparerStub
	};
};

describe('DbAuthentication UseCase', () => {
	test('Should call LoadAccountByEmailRepository with correct email.', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut();
		const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load');
		await sut.auth(makeFakeAuthentication());
		expect(loadSpy).toHaveBeenCalledWith('any_mail@mail.com');
	});

	test('Should throw if LoadAccountByEmailRepository throws.', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut();
		jest.spyOn(loadAccountByEmailRepositoryStub, 'load')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
		const promise = sut.auth(makeFakeAuthentication());
		await expect(promise).rejects.toThrow();
	});

	test('Should return null if LoadAccountByEmailRepository returns null.', async () => {
		const { sut, loadAccountByEmailRepositoryStub } = makeSut();
		jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null);
		const accessToken = await sut.auth(makeFakeAuthentication());
		expect(accessToken).toBeNull();
	});

	test('Should call hashComparer with correct values.', async () => {
		const { sut, hashComparerStub } = makeSut();
		const loadSpy = jest.spyOn(hashComparerStub, 'compare');
		await sut.auth(makeFakeAuthentication());
		expect(loadSpy).toHaveBeenCalledWith('any_password', 'hashed_password');
	});

	test('Should throw if hashComparer throws.', async () => {
		const { sut, hashComparerStub } = makeSut();
		jest.spyOn(hashComparerStub, 'compare')
			.mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())));
		const promise = sut.auth(makeFakeAuthentication());
		await expect(promise).rejects.toThrow();
	});

	test('Should return null if hashComparer returns false.', async () => {
		const { sut, hashComparerStub } = makeSut();
		jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(new Promise(resolve => resolve(false)));
		const accessToken = await sut.auth(makeFakeAuthentication());
		expect(accessToken).toBeNull();
	});
});