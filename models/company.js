module.exports = (sequelize, DataTypes) => {
  return sequelize.define ('company', {
    // instantiating will automatically set the flag to true if not set
    flag: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    uuid: {
      type:DataTypes.STRING,
      primaryKey:true 
    },

    status: {
      type:DataTypes.STRING
    },

    ultima_atualizacao: {
      type:DataTypes.STRING
    },

    cnpj: {
      type:DataTypes.STRING
    },

    cnpjFormatted: {
      type:DataTypes.STRING
    },

    tipo: {
      type:DataTypes.STRING
    },

    abertura: {
      type:DataTypes.STRING
    },

    nome: {
      type:DataTypes.STRING
    },

    fantasia: {
      type:DataTypes.STRING
    },

    natureza_juridica: {
      type:DataTypes.STRING
    },

    logradouro: {
      type:DataTypes.STRING
    },

    numero: {
      type:DataTypes.STRING
    },

    complemento: {
      type:DataTypes.STRING
    },

    cep: {
      type:DataTypes.STRING
    },

    bairro: {
      type:DataTypes.STRING
    },

    municipio: {
      type:DataTypes.STRING
    },

    uf: {
      type:DataTypes.STRING
    },

    email: {
      type:DataTypes.STRING
    },

    telefone: {
      type:DataTypes.STRING
    },

    efr: {
      type:DataTypes.STRING
    },

    situacao: {
      type:DataTypes.STRING
    },

    data_situacao: {
      type:DataTypes.STRING
    },

    motivo_situacao: {
      type:DataTypes.STRING
    },

    situacao_especial: {
      type:DataTypes.STRING
    },

    data_situacao_especial: {
      type:DataTypes.STRING
    },

    capital_social: {
      type:DataTypes.STRING
    },

    //NULL if not, X-message-id if sent
    emailSent: {
      type:DataTypes.STRING
    },

    emailDelivery: {
      type:DataTypes.BOOLEAN
    },

    //NULL if not, name of the file if received
    pdfCreated: {
      type:DataTypes.STRING
    },

  }, {
      timestamps: true,

      // don't delete database entries but set the newly added attribute deletedAt
      // to the current date (when deletion was done). paranoid will only work if
      // timestamps are enabled
      paranoid: true,
    });
}
