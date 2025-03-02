import { ResourcesConfig } from "aws-amplify";

const awsExports: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: "eu-west-2_tnrGo3zX8",
            userPoolClientId: "7hur5idj1dt5jo158qmlj5edm4",
            identityPoolId: "eu-west-2:3685a382-772f-459f-bdf5-09230ce8a935",
            signUpAttributes: ["EMAIL", "NAME"],
            passwordFormat: {
                minLength: 8
            },
            mfa: {
                status: "off",
                types: ["sms"]
            },
            usernameAttributes: ["email"],
            verificationMechanisms: ["email"]
        }
    },
    API: {
        GraphQL: {
            endpoint: "https://xhjqcd2uajdqjlproyxpv4vngy.appsync-api.eu-west-2.amazonaws.com/graphql",
            region: "eu-west-2",
            defaultAuthMode: "apiKey",
            apiKey: "da2-ysriob2sobgafkqd2z763d3rve"
        }
    }
};

export default awsExports;