import { IValidation } from '../../../../presentation/controllers/login/signUp/signup-controller-protocols';
import { CompareFieldsValidation, EmailValidation, RequiredFieldValidation, ValidationComposite } from '../../../../validation/validators';
import { EmailValidatorAdapter } from '../../../../infra/validators/email-validator-adapter';

export const makeSignUpValidation = ():ValidationComposite => {
	const validations:IValidation[] = [];
	for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
		validations.push(new RequiredFieldValidation(field));
	}
	validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'));
	validations.push(new EmailValidation('email', new EmailValidatorAdapter()));
	return new ValidationComposite(validations);
};
