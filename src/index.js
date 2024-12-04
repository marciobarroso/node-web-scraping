const axios = require('axios');
const XLSX = require('xlsx');
const fs = require('fs');
const json = require('./configurations.json')

const getRegionById = (id) => {
  let found = null
  for( const region of json.configurations.regions ) {
    if( region.id == id ) {
      found = region
      break
    }
  }
  return found
}

const getCommuneById = (id) => {
  let found = null
  for( const commune of json.configurations.communes ) {
    if( commune.id == id ) {
      found = commune
      break
    }
  }
  return found
}

async function fetchAndProcessData() {
  const getURL = (id) => `https://condominios-api.minvu.cl/administradores/${id}`
  const data = []; // Array para armazenar os dados

  for (let id = 1; id <= 1260; id++) {
    try {
      // Fazer a requisição HTTP
      const response = await axios.get(getURL(id));

      // Garantir que o formato seja JSON
      const user = response.data;

      // Extrair os campos específicos
      const { nombres, apellido_uno, apellido_dos, rut, email, telefono_uno, telefono_dos, calle, calle_numeracion, id_region, id_comuna, solicitudAdministradorNatural, solicitudAdministradorJuridico } = user;
      if (nombres) {
        data.push(
          { ID: id,
            Name: nombres,
            Lastname: (apellido_uno + ' ' + apellido_dos).trim(),
            RUT: rut,
            Email: email,
            Phone_1: telefono_uno ? telefono_uno : '',
            Phone_2: telefono_dos ? telefono_dos : '',
            Address: calle + ', ' + calle_numeracion,
            Commune: getCommuneById(id_comuna).name,
            Region: getRegionById(id_region).name,
            Gender: solicitudAdministradorNatural ? solicitudAdministradorNatural.sexo : solicitudAdministradorJuridico ? solicitudAdministradorJuridico.sexo : null
          });
      }
    } catch (error) {
      console.error(`Erro ao processar ID ${id}: ${error.message}`);
    }
  }

  fs.writeFile("data.json", JSON.stringify(data, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo:", err);
    } else {
      console.log("Arquivo salvo com sucesso!");
    }
  });

  return

  // Gerar arquivo Excel
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuários');

  // Salvar arquivo
  const filePath = 'users.xlsx';
  XLSX.writeFile(workbook, filePath);
  console.log(`Arquivo Excel gerado: ${filePath}`);
}

// Executar a função
fetchAndProcessData();

const filterData = () => {
  const data = require('../data.json')
  const filteredData = []

  for( const contact of data) {
    if( contact.Region === 'METROPOLITANA DE SANTIAGO' ) {
      filteredData.push(contact)
    }
  }

  fs.writeFile("administradores-region-metropolitana.json", JSON.stringify(filteredData, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo:", err);
    } else {
      console.log("Arquivo salvo com sucesso!");
    }
  });
}

// filterData()

