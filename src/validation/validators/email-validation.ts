import { InvalidParamError } from '../../presentation/errors';
import { IEmailValidator } from '../protocols/email-validator';
import { IValidation } from '../../presentation/protocols/validation';

export class EmailValidation implements IValidation {
	constructor (
	private readonly fieldName :string,
	private readonly emailValidator:IEmailValidator) {
		this.fieldName = fieldName;
		this.emailValidator = emailValidator;
	}

	validate (input: any): Error {
		const isValid = this.emailValidator.isValid(input[this.fieldName]);
		if (!isValid) {
			return new InvalidParamError(this.fieldName);
		}
	}
}
