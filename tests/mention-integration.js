/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';

import MentionEditing from '../src/mentionediting';

describe( 'MentionEditing - integration', () => {
	let div, editor, model, doc;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		div = document.createElement( 'div' );
		document.body.appendChild( div );

		return ClassicTestEditor.create( div, { plugins: [ Paragraph, MentionEditing, UndoEditing ] } )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
				doc = model.document;
			} );
	} );

	afterEach( () => {
		div.remove();

		return editor.destroy();
	} );

	describe( 'undo', () => {
		beforeEach( () => {
			model.schema.extend( '$text', { allowAttributes: [ 'bold' ] } );
			editor.conversion.attributeToElement( { model: 'bold', view: 'strong' } );
		} );

		// Failing test. See ckeditor/ckeditor5#1645.
		it( 'should restore removed mention on adding a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 6 );

				writer.insertText( 'a', doc.selection.getAttributes(), writer.createPositionAt( paragraph, 6 ) );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jaohn bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo @Jaohn bar</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
		} );

		// Failing test. See ckeditor/ckeditor5#1645.
		it( 'should restore removed mention on removing a text inside mention', () => {
			editor.setData( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );

			model.change( writer => {
				const paragraph = doc.getRoot().getChild( 0 );

				writer.setSelection( paragraph, 7 );

				model.modifySelection( doc.selection, { direction: 'backward', unit: 'codepoint' } );
				model.deleteContent( doc.selection );
			} );

			expect( editor.getData() ).to.equal( '<p>foo @Jhn bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p>foo @Jhn bar</p>' );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( '<p>foo <span class="mention" data-mention="John">@John</span> bar</p>' );
		} );

		it( 'should work with attribute post-fixer (beginning formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="John">@John</span> bar</p>',
				'<p><strong>foo </strong><span class="mention" data-mention="John"><strong>@John</strong></span> bar</p>',
				() => {
					model.change( writer => {
						const paragraph = doc.getRoot().getChild( 0 );
						const start = writer.createPositionAt( paragraph, 0 );
						const range = writer.createRange( start, start.getShiftedBy( 6 ) );

						writer.setSelection( range );

						writer.setAttribute( 'bold', true, range );
					} );
				} );
		} );

		it( 'should work with attribute post-fixer (end formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="John">@John</span> bar</p>',
				'<p>foo <span class="mention" data-mention="John"><strong>@John</strong></span><strong> ba</strong>r</p>',
				() => {
					model.change( writer => {
						const paragraph = doc.getRoot().getChild( 0 );
						const start = writer.createPositionAt( paragraph, 6 );
						const range = writer.createRange( start, start.getShiftedBy( 6 ) );

						writer.setSelection( range );

						writer.setAttribute( 'bold', true, range );
					} );
				} );
		} );

		it( 'should work with attribute post-fixer (middle formatted)', () => {
			testAttributePostFixer(
				'<p>foo <span class="mention" data-mention="John">@John</span> bar</p>',
				'<p>foo <span class="mention" data-mention="John"><strong>@John</strong></span> bar</p>',
				() => {
					model.change( writer => {
						const paragraph = doc.getRoot().getChild( 0 );
						const start = writer.createPositionAt( paragraph, 6 );
						const range = writer.createRange( start, start.getShiftedBy( 1 ) );

						writer.setSelection( range );

						writer.setAttribute( 'bold', true, range );
					} );
				} );
		} );

		function testAttributePostFixer( initialData, expectedData, testCallback ) {
			editor.setData( initialData );

			expect( editor.getData() ).to.equal( initialData );

			testCallback();

			expect( editor.getData() )
				.to.equal( expectedData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( expectedData );

			editor.execute( 'undo' );

			expect( editor.getData() ).to.equal( initialData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( initialData );

			editor.execute( 'redo' );

			expect( editor.getData() )
				.to.equal( expectedData );
			expect( getViewData( editor.editing.view, { withoutSelection: true } ) )
				.to.equal( expectedData );
		}
	} );
} );
