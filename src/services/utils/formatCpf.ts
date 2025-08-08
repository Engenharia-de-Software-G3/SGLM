export function formatCPF(cpf: string): string {
    // Remove all non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '')
    
    // Check if it's a valid CPF length (11 digits)
    if (cleanCPF.length !== 11) {
        return cpf // Return original if invalid length
    }
    
    // Format as XXX.XXX.XXX-XX
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}