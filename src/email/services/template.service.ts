import { Injectable } from "@nestjs/common";

@Injectable()
export class TemplateService {

    async getTemplate(templateName: string): Promise<string> {
        switch (templateName) {
            case 'confirmation':
                return `
                <html>
                    <h1>Confirm your email address</h1>
                    <p>Click the link below to confirm your email address</p>
                    <a href="{{confirmation_link}}">Confirm email address</a>
                </html>
                `;
            case 'welcome':
                return `
                <html>
                    <h1>Welcome to Play & Swap</h1>
                    <p>Hi {{username}}, welcome to Play & Swap</p>
                </html>
                `;
            default:
                return '';
        }
    }

    replaceDataInMailTemplate(template: string, data: any): string {
        for (const key in data)
            template = template.replace(`{{${key}}}`, data[key]);

        return template;
    }

    transformTemplateToText(template: string): string {
        return template.replace(/<[^>]*>/g, '');
    }

}
