/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global console, window */

import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Mention from '../../src/mention';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Font from '@ckeditor/ckeditor5-font/src/font';

ClassicEditor
	.create( global.document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Underline, Font, Mention ],
		toolbar: [
			'heading',
			'|', 'bulletedList', 'numberedList', 'blockQuote',
			'|', 'bold', 'italic', 'underline', 'link',
			'|', 'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor',
			'|', 'insertTable',
			'|', 'undo', 'redo'
		],
		mention: {
			feeds: [
				{
					feed: [ 'Barney', 'Lily', 'Marshall', 'Robin', 'Ted' ],
					itemRenderer: item => item.text
				},
				{
					marker: '#',
					feed: [
						'a01', 'a02', 'a03', 'a04', 'a05', 'a06', 'a07', 'a08', 'a09', 'a10',
						'a11', 'a12', 'a13', 'a14', 'a15', 'a16', 'a17', 'a18', 'a19', 'a20'
					]
				}
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
