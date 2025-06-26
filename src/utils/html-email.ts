export const htmlEmailConfirmationCodeLetter = (code: string | null) => {
    return `
<h1>Thank for your registration</h1>
<p>To finish registration please follow the link below:
    <a href='https://google.com?code=${code}'>complete registration</a>
</p>
`;
};
export const htmlEmailPasswordRecoveryLetter = (recoveryLink: string) => {
    return `
<h1>Password recovery</h1>
<p>To finish password recovery please follow the link below:
    <a href='${recoveryLink}'>recovery password</a>
</p>
`;
};