export function signupErrorMessage(code?: string): string {
  switch (code) {
    case "email_address_invalid":
    case "validation_failed":
      return "Informe um endereço de email real e válido.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
    case "weak_password":
      return "Use uma senha mais forte, com letras, números e caracteres especiais.";
    case "user_already_exists":
      return "Se esta conta já existir, entre ou recupere sua senha.";
    default:
      return "Não foi possível criar sua conta agora. Revise os dados e tente novamente.";
  }
}
