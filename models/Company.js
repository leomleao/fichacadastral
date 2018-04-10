
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  uuid: String,
  status: String,
  ultima_atualizacao: String,
  cnpj: String,   
  cnpjFormatted: String,   
  tipo: String,   
  abertura: String,  
  nome: String,  
  fantasia: String,
  atividade_principal: {
    code: String,
    text: String
  },
  atividades_secundarias: Array,
  natureza_juridica: String,
  logradouro: String,
  numero: String,
  complemento: String,
  cep: String,
  bairro: String,
  municipio: String,
  uf: String,
  email: String,
  telefone: String,
  efr: String,
  situacao: String,
  data_situacao: String,
  motivo_situacao: String,
  situacao_especial: String,
  data_situacao_especial: String,
  capital_social: String,
  qsa: Array,

  //from now on is app related, not related directly to the CNPJ consult

  aplicacao_material: String,
  contribuinte_ICMS: Boolean,
  email_XML: String,
  regime_especial: Boolean,
  regimes_especiais: Array,
  contato_financeiro_nome: String,
  contato_financeiro_telefone: String,
  contato_financeiro_email: String,
  codigo_suframa: String,
  inscricao_estadual: String,
  inscricao_municipal: String,
  ultima_alteracao: String,
  entregue: String,

}, { timestamps: true });


const Company = mongoose.model('Company', companySchema);

module.exports = Company;
