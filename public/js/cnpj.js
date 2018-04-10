/*
 * Brazillian CPF number (Cadastrado de Pessoas Físicas) is the equivalent of a Brazilian tax registration number.
 * CPF numbers have 11 digits in total: 9 numbers followed by 2 check numbers that are being used for validation.
 */


jQuery.validator.addMethod("cnpj", function( cnpj ) {

	var numeros, digitos, soma, resultado, pos, tamanho,
		digitos_iguais = true;

	// Removing special characters from value
	cnpj = cnpj.replace( /([~!@#$%^&*()_+=`{}\[\]\-|\\:;'<>,.\/? ])+/g, "" );


	if (cnpj.length < 14 && cnpj.length > 15)
		return false;

	for (var i = 0; i < cnpj.length - 1; i++)
		if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
			digitos_iguais = false;
			break;
		}

	if (!digitos_iguais) {
		tamanho = cnpj.length - 2
		numeros = cnpj.substring(0,tamanho);
		digitos = cnpj.substring(tamanho);
		soma = 0;
		pos = tamanho - 7;

		for (i = tamanho; i >= 1; i--) {
			soma += numeros.charAt(tamanho - i) * pos--;
			if (pos < 2)
				pos = 9;
		}

		resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

		if (resultado != digitos.charAt(0))
			return false;

		tamanho = tamanho + 1;
		numeros = cnpj.substring(0,tamanho);
		soma = 0;
		pos = tamanho - 7;

		for (i = tamanho; i >= 1; i--) {
			soma += numeros.charAt(tamanho - i) * pos--;
			if (pos < 2)
				pos = 9;
		}

		resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

		if (resultado != digitos.charAt(1))
			return false;

		return true;
	}

	return false;
}, "Informe um CNPJ v&aacute;lido.");
