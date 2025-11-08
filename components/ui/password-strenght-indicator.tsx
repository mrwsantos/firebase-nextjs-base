// src/components/ui/PasswordStrengthIndicator.tsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { checkPasswordCriteria, getPasswordStrength } from '@/validation/registerUser';

interface PasswordStrengthIndicatorProps {
    password: string;
    showStrengthBar?: boolean;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
    password,
    showStrengthBar = true
}) => {
    const criteria = checkPasswordCriteria(password);
    const strength = getPasswordStrength(password);

    const criteriaList = [
        { key: 'minLength', label: 'At least 6 characters', met: criteria.minLength },
        { key: 'hasUppercase', label: 'One uppercase letter', met: criteria.hasUppercase },
        { key: 'hasLowercase', label: 'One lowercase letter', met: criteria.hasLowercase },
        { key: 'hasNumber', label: 'One number', met: criteria.hasNumber },
        // { key: 'hasSpecialChar', label: 'One special character (@$!%*?&)', met: criteria.hasSpecialChar },
    ];

    const strengthColors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-secondary-2',
    };

    const strengthWidth = {
        weak: 'w-1/3',
        medium: 'w-2/3',
        strong: 'w-full',
    };

    return (
        <div className="space-y-3">
            {/* Strength Bar */}
            {showStrengthBar && password.length > 0 && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Password strength</span>
                        <span className={`font-normal capitalize ${strength === 'weak' ? 'text-red-600' :
                                strength === 'medium' ? 'text-yellow-600' :
                                    'text-dark-grey'
                            }`}>
                            {strength}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${strengthColors[strength]} ${strengthWidth[strength]}`}
                        />
                    </div>
                </div>
            )}

            {/* Criteria List */}
            <div className="grid grid-cols-1 gap-1">
                {criteriaList.map((criterion) => (
                    <div
                        key={criterion.key}
                        className={`flex items-center gap-2 text-xs transition-colors duration-200 ${criterion.met ? 'text-dark-grey' : 'text-gray-500'
                            }`}
                    >
                        {criterion.met ? (
                            <Check className="h-3 w-3 text-dark-grey" />
                        ) : (
                            <X className="h-3 w-3 text-gray-400" />
                        )}
                        <span>{criterion.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Versão compacta para espaços menores
export const PasswordStrengthCompact: React.FC<PasswordStrengthIndicatorProps> = ({
    password
}) => {
    const criteria = checkPasswordCriteria(password);
    const validCount = Object.values(criteria).filter(Boolean).length;
    const totalCount = Object.keys(criteria).length;

    return (
        <div className="flex flex-wrap gap-1 text-xs items-center">
            <span className={`px-2 py-1 rounded ${criteria.minLength ? 'bg-secondary-2/50 text-dark-grey' : 'bg-gray-100 text-gray-500'}`}>
                8+ chars
            </span>
            <span className={`px-2 py-1 rounded ${criteria.hasUppercase ? 'bg-secondary-2/50 text-dark-grey' : 'bg-gray-100 text-gray-500'}`}>
                A-Z
            </span>
            <span className={`px-2 py-1 rounded ${criteria.hasLowercase ? 'bg-secondary-2/50 text-dark-grey' : 'bg-gray-100 text-gray-500'}`}>
                a-z
            </span>
            <span className={`px-2 py-1 rounded ${criteria.hasNumber ? 'bg-secondary-2/50 text-dark-grey' : 'bg-gray-100 text-gray-500'}`}>
                0-9
            </span>
            {/* <span className={`px-2 py-1 rounded ${criteria.hasSpecialChar ? 'bg-secondary-2/50 text-dark-grey' : 'bg-gray-100 text-gray-500'}`}>
                @$!%
            </span> */}

            {password.length > 0 && (
                <span className="text-gray-600 ml-2">
                    {validCount}/{totalCount}
                </span>
            )}
        </div>
    );
};