const request = require('request-promise')
const cheerio = require('cheerio')
const excel = require('excel4node')

const getURL = (id) => `http://www.condominios.cl/redes_redadm_ficha.php?id=ObrnZFkMSIOLyV0s66W9&w=${id}`

const getParsedInformation = async (id) => {
	const option = {
		uri: getURL(id),
		transform: (body) => {
			return cheerio.load(body)
		}
	}

	const $ = await request(option)
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
	}

	if (item && item.name && item.name !== '') {
		return item
	} else {
		return
	}
}

const createSpreadsheet = async (data) => {
	var workbook = new excel.Workbook()
	var worksheet = workbook.addWorksheet('Adminitrators')
	var worksheetIndex = 1

	worksheet.cell(worksheetIndex, 1).string('Name')
	worksheet.cell(worksheetIndex, 2).string('Profession')
	worksheet.cell(worksheetIndex, 3).string('Address')
	worksheet.cell(worksheetIndex, 4).string('Phone')
	worksheet.cell(worksheetIndex, 5).string('E-mail')
	worksheet.cell(worksheetIndex, 6).string('Site')
	worksheet.cell(worksheetIndex, 7).string('Region')
	worksheet.cell(worksheetIndex, 8).string('Services')
	worksheet.cell(worksheetIndex++, 9).string('URL')

	for (var index = 0; index < data.length; index++) {
		var item = data[index]

		if (item && item.name && item.email) {
			worksheet.cell(worksheetIndex, 1).string(item.name)
			worksheet.cell(worksheetIndex, 2).string(item.profession)
			worksheet.cell(worksheetIndex, 3).string(item.address)
			worksheet.cell(worksheetIndex, 4).string(item.phone)
			worksheet.cell(worksheetIndex, 5).string(item.email)
			worksheet.cell(worksheetIndex, 6).string(item.site)
			worksheet.cell(worksheetIndex, 7).string(item.region)
			worksheet.cell(worksheetIndex, 8).string(item.services)
			worksheet.cell(worksheetIndex++, 9).string(item.url)
		}
	}

	workbook.write('administrators.xlsx')
}
;(async () => {
	var data = []

	for (var index = 1; index < 1000; index++) {
		var item = await getParsedInformation(index)

		if (item && item.name && item.name !== '') {
			console.log(`${index} ${item.name} ${item.email}`)
			data.push(item)
		}
	}

	await createSpreadsheet(data)
})()

const getBaseSelector = () =>
	'table tbody tr td table tbody tr td table tbody tr td table tbody tr td table tbody tr:nth-child(3) td table tbody tr td:nth-child(3) table'

const getText = ($, selector) => {
	const selectorBase = getBaseSelector()
	return $(selectorBase + ' ' + selector).text()
}

const getHtml = ($, selector) => {
	const selectorBase = getBaseSelector()
	return $(selectorBase + ' ' + selector).html()
}

const getName = ($) => $('td.foro_titulo_foro').text()

const getProfession = ($) => getHtml($, 'tbody tr td:nth-child(2)')

const getAddress = ($) => getHtml($, 'tbody tr:nth-child(2) td:nth-child(2)')

const getPhone = ($) => getHtml($, 'tbody tr:nth-child(3) td:nth-child(2)')

const getEmail = ($) => getText($, 'tbody tr:nth-child(4) td:nth-child(2) a')

const getSite = ($) => getText($, 'tbody tr:nth-child(5) td:nth-child(2) a')

const getRegion = ($) => {
	const text = getHtml($, 'tbody tr:nth-child(6) td div')
	if (!text || text === '') return ''
	return text
		.replace('<strong>Ciudades / Sectores en los que se desempe&#xF1;a: </strong><br>', '')
		.replace('&#xA0;<br>', '')
		.replace(/\s*/g, '')
}

const getServices = ($) => {
	const text = getHtml($, 'tbody tr:nth-child(6) td p')
	if (!text || text === '') return ''
	return text.replace(/<br>\s*/g, '')
}
