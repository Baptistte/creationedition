// Gestion de l'authentification
export class AuthManager {
    static getToken() {
        return localStorage.getItem('adminToken');
    }

    static getAdminInfo() {
        const info = localStorage.getItem('adminInfo');
        return info ? JSON.parse(info) : null;
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        window.location.href = './login.html';
    }

    static async verifyToken() {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }

        try {
            const response = await fetch('/.netlify/functions/auth-verify', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Erreur vérification token:', error);
            return false;
        }
    }

    static async requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = './login.html';
            return false;
        }

        const isValid = await this.verifyToken();
        
        if (!isValid) {
            this.logout();
            return false;
        }

        return true;
    }
}

// Client API
export class ApiClient {
    static async request(endpoint, options = {}) {
        const token = AuthManager.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        };

        try {
            const response = await fetch(`/.netlify/functions/${endpoint}`, mergedOptions);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    AuthManager.logout();
                }
                throw new Error(data.error || 'Erreur API');
            }

            return data;
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // Clients
    static async getClients() {
        return this.request('clients', { method: 'GET' });
    }

    static async createClient(data) {
        return this.request('clients', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateClient(data) {
        return this.request('clients', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteClient(id) {
        return this.request('clients', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }

    // Devis
    static async getDevis() {
        return this.request('devis', { method: 'GET' });
    }

    static async createDevis(data) {
        return this.request('devis', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateDevis(data) {
        return this.request('devis', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteDevis(id) {
        return this.request('devis', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }

    // Projets
    static async getProjets() {
        return this.request('projets', { method: 'GET' });
    }

    static async createProjet(data) {
        return this.request('projets', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateProjet(data) {
        return this.request('projets', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteProjet(id) {
        return this.request('projets', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }

    // Factures
    static async getFactures() {
        return this.request('factures', { method: 'GET' });
    }

    static async createFacture(data) {
        return this.request('factures', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateFacture(data) {
        return this.request('factures', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteFacture(id) {
        return this.request('factures', {
            method: 'DELETE',
            body: JSON.stringify({ id }),
        });
    }
}

