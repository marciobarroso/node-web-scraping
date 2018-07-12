const request = require('request-promise');
const cheerio = require('cheerio');
const excel = require('excel4node');

const getURL = (id) => `http://www.condominios.cl/redes_redadm_ficha.php?id=ObrnZFkMSIOLyV0s66W9&w=${id}`;

const createOption = (id) => {
	return {
		uri: getURL(id),
		transform: (body) => {
			return cheerio.load(body);
		}
	};
};

const exportExcelFile = (data) => {
	console.log('Creating XLSX');
	var workbook = new excel.Workbook();
	var worksheet = workbook.addWorksheet('Adminitrators');

	worksheet.cell(1,1).string('Name');
	worksheet.cell(1,2).string('Profession');
	worksheet.cell(1,3).string('Address');
	worksheet.cell(1,4).string('Phone');
	worksheet.cell(1,5).string('E-mail');
	worksheet.cell(1,6).string('Site');
	worksheet.cell(1,7).string('Region');
	worksheet.cell(1,8).string('Services');
	worksheet.cell(1,9).string('URL');

	var index = 2;
	data.forEach(item => {
		worksheet.cell(index, 1).string(item.name);
		worksheet.cell(index, 2).string(item.profession);
		worksheet.cell(index, 3).string(item.address);
		worksheet.cell(index, 4).string(item.phone);
		worksheet.cell(index, 5).string(item.email);
		worksheet.cell(index, 6).string(item.site);
		worksheet.cell(index, 7).string(item.region);
		worksheet.cell(index, 8).string(item.services);
		worksheet.cell(index++, 9).string(item.url);
	});

	workbook.write('administrators.xlsx');
};

async function NodeWebScraperPromise(id) {
	const option = createOption(id);
	return await request(option).then($ => {
		const item = {
			name: getName($),
			profession: getProfession($),
			address: getAddress($),
			phone: getPhone($),
			email: getEmail($),
			site: getSite($),
			region: getRegion($),
			services: getServices($),
			url: getURL(id)
		};

		if( item && item.name && item.name !== '' ) {
			console.log('resolve id ' + id);
			return item;
		} else {
			console.log('reject id ' + id);
			return {};
		}
	}).catch(() => {
		console.log('error for id ' + id);
		return {};
	});
};

const start = 800;
const total = 200;
var promises = [];

for( let index=start; index<(total+start); index++ ) {
	promises.push(NodeWebScraperPromise(index));
};

Promise.all(promises).then(data => {
	console.log('Data Loaded');
	exportExcelFile(data.filter(item => item && item.name !== undefined && item.name !== ''));
}).catch(error => console.error(error));

const getBaseSelector = () => 'table tbody tr td table tbody tr td table tbody tr td table tbody tr td table tbody tr:nth-child(3) td table tbody tr td:nth-child(3) table';

const getText = ($, selector) => {
	const selectorBase = getBaseSelector();
	return $(selectorBase + ' ' + selector).text();
};

const getHtml = ($, selector) => {
	const selectorBase = getBaseSelector();
	return $(selectorBase + ' ' + selector).html();
}

const getName = $ => $('td.foro_titulo_foro').text();

const getProfession = $ => getHtml($, 'tbody tr td:nth-child(2)');

const getAddress = $ => getHtml($, 'tbody tr:nth-child(2) td:nth-child(2)');

const getPhone = $ => getHtml($, 'tbody tr:nth-child(3) td:nth-child(2)');

const getEmail = $ => getText($, 'tbody tr:nth-child(4) td:nth-child(2) a');

const getSite = $ => getText($, 'tbody tr:nth-child(5) td:nth-child(2) a');

const getRegion = $ => {
	const text = getHtml($, 'tbody tr:nth-child(6) td div');
	if( !text || text === '' ) return '';
	return text.replace('<strong>Ciudades / Sectores en los que se desempe\&#xF1;a: </strong><br>', '').replace('&#xA0;<br>','').replace(/\s*/g, '');
};

const getServices = $ => {
	const text = getHtml($, 'tbody tr:nth-child(6) td p');
	if( !text || text === '' ) return '';
	return text.replace(/<br>\s*/g,'');
};