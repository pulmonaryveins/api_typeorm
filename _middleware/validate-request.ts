import { Request, NextFunction } from 'express';
import { Schema, ValidationError, ValidationOptions } from 'joi';

function validateRequest(req: Request, next: NextFunction, schema: Schema): void {
    // Validation options:
    const options: ValidationOptions = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    };
    
    // Validate the request body against the schema
    const { error, value } = schema.validate(req.body, options);

    if (error) {
        // If validation fails, pass an error message to the next middleware
        next(`Validation Error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        // If valid, replace req.body with the sanitized/validated data
        req.body = value;
        next();
    }
}

export default validateRequest;