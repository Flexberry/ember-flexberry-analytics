import { Enumeration } from '../utils/enum-functions';

export default new Enumeration({
  PageableHtml: 'table/html;page-mode=page',
  FullHtml: 'table/html;page-mode=stream',
  PDF: 'pageable/pdf',
  CSV: 'table/csv;page-mode=stream',
  Xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;page-mode=flow'
});
