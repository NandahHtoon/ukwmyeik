odoo.define('documents.mobile_tests', function (require) {
"use strict";

const DocumentsKanbanView = require('documents.DocumentsKanbanView');
const {createDocumentsKanbanView} = require('documents.test_utils');
const {dom} = require('web.test_utils');

QUnit.module('Views');

QUnit.module('DocumentsKanbanViewMobile', {
    beforeEach() {
        this.data = {
            'documents.document': {
                fields: {
                    available_rule_ids: {string: "Rules", type: 'many2many', relation: 'documents.workflow.rule'},
                    folder_id: {string: "Folders", type: 'many2one', relation: 'documents.folder'},
                    name: {string: "Name", type: 'char', default: ' '},
                    owner_id: {string: "Owner", type: "many2one", relation: 'user'},
                    partner_id: {string: "Related partner", type: 'many2one', relation: 'user'},
                    res_model: {string: "Model (technical)", type: 'char'},
                    tag_ids: {string: "Tags", type: 'many2many', relation: 'documents.tag'},
                },
                records: [
                    {id: 1, available_rule_ids: [], folder_id: 1},
                    {id: 2, available_rule_ids: [], folder_id: 1},
                ],
            },
            'documents.folder': {
                fields: {
                    name: {string: 'Name', type: 'char'},
                    parent_folder_id: {string: 'Parent Workspace', type: 'many2one', relation: 'documents.folder'},
                    description: {string: 'Description', type:'text'},
                },
                records: [
                    {id: 1, name: 'Workspace1', description: '_F1-test-description_', parent_folder_id: false},
                ],
            },
            'documents.tag': {
                fields: {},
                records: [],
                get_tags: () => [],
            },
            'user': {
                fields: {},
                records: [],
            },
        };
    },
}, function () {
    QUnit.test('basic rendering on mobile', async function (assert) {
        assert.expect(12);

        const kanban = await createDocumentsKanbanView({
            View: DocumentsKanbanView,
            model: 'documents.document',
            data: this.data,
            arch: `
                <kanban>
                    <templates>
                        <t t-name="kanban-box">
                            <div>
                                <field name="name"/>
                            </div>
                        </t>
                    </templates>
                </kanban>
            `,
        });

        assert.containsOnce(kanban, '.o_documents_kanban_view',
            "should have a documents kanban view");
        assert.containsOnce(kanban, '.o_documents_inspector',
            "should have a documents inspector");

        const $controlPanelButtons = $('.o_control_panel .o_cp_buttons');
        assert.containsOnce($controlPanelButtons, '> .dropdown',
            "should group ControlPanel's buttons into a dropdown");
        assert.containsNone($controlPanelButtons, '> .btn',
            "there should be no button left in the ControlPanel's left part");

        // open search panel
        await dom.click(kanban.$('.o_search_panel_current_selection'));
        // select global view
        await dom.click(kanban.$('.o_search_panel_category_value header:eq(0)'));
        // close search panel
        await dom.click(kanban.$('.o_search_panel_mobile_close'));
        assert.ok(kanban.$buttons.find('.o_documents_kanban_upload').is(':disabled'),
            "the upload button should be disabled on global view");
        assert.ok(kanban.$buttons.find('.o_documents_kanban_url').is(':disabled'),
            "the upload url button should be disabled on global view");
        assert.ok(kanban.$buttons.find('.o_documents_kanban_request').is(':disabled'),
            "the request button should be disabled on global view");
        assert.ok(kanban.$buttons.find('.o_documents_kanban_share').is(':disabled'),
            "the share button should be disabled on global view");

        // open search panel
        await dom.click(kanban.$('.o_search_panel_current_selection'));
        // select first folder
        await dom.click(kanban.$('.o_search_panel_category_value header:eq(1)'));
        // close search panel
        await dom.click(kanban.$('.o_search_panel_mobile_close'));
        assert.ok(kanban.$buttons.find('.o_documents_kanban_upload').not(':disabled'),
            "the upload button should be enabled when a folder is selected");
        assert.ok(kanban.$buttons.find('.o_documents_kanban_url').not(':disabled'),
            "the upload url button should be enabled when a folder is selected");
        assert.ok(kanban.$buttons.find('.o_documents_kanban_request').not(':disabled'),
            "the request button should be enabled when a folder is selected");
        assert.ok(kanban.$buttons.find('.o_documents_kanban_share').not(':disabled'),
            "the share button should be enabled when a folder is selected");

        kanban.destroy();
    });

    QUnit.module('DocumentsInspector');

    QUnit.test('toggle inspector based on selection', async function (assert) {
        assert.expect(13);

        const kanban = await createDocumentsKanbanView({
            View: DocumentsKanbanView,
            model: 'documents.document',
            data: this.data,
            arch: `
                <kanban>
                    <templates>
                        <t t-name="kanban-box">
                            <div>
                                <i class="fa fa-circle-thin o_record_selector"/>
                                <field name="name"/>
                            </div>
                        </t>
                    </templates>
                </kanban>
            `,
        });

        assert.isNotVisible(kanban.$('.o_documents_mobile_inspector'),
            "inspector should be hidden when selection is empty");
        assert.containsN(kanban, '.o_kanban_record:not(.o_kanban_ghost)', 2,
            "should have 2 records in the renderer");

        // select a first record
        await dom.click(kanban.$('.o_kanban_record:first .o_record_selector'));
        assert.containsOnce(kanban, '.o_kanban_record.o_record_selected:not(.o_kanban_ghost)',
            "should have 1 record selected");
        const toggleInspectorSelector = '.o_documents_mobile_inspector > .o_documents_toggle_inspector';
        assert.isVisible(kanban.$(toggleInspectorSelector),
            "toggle inspector's button should be displayed when selection is not empty");
        assert.strictEqual(kanban.$(toggleInspectorSelector).text().replace(/\s+/g, " ").trim(), '1 document selected');

        await dom.click(kanban.$(toggleInspectorSelector));
        assert.isVisible(kanban.$('.o_documents_mobile_inspector'),
            "inspector should be opened");

        await dom.click(kanban.$('.o_documents_close_inspector'));
        assert.isNotVisible(kanban.$('.o_documents_mobile_inspector'),
            "inspector should be closed");

        // select a second record
        await dom.click(kanban.$('.o_kanban_record:eq(1) .o_record_selector'));
        assert.containsN(kanban, '.o_kanban_record.o_record_selected:not(.o_kanban_ghost)', 2,
            "should have 2 records selected");
        assert.strictEqual(kanban.$(toggleInspectorSelector).text().replace(/\s+/g, " ").trim(), '2 documents selected');

        // click on the record
        await dom.click(kanban.$('.o_kanban_record:first'));
        assert.containsOnce(kanban, '.o_kanban_record.o_record_selected:not(.o_kanban_ghost)',
            "should have 1 record selected");
        assert.strictEqual(kanban.$(toggleInspectorSelector).text().replace(/\s+/g, " ").trim(), '1 document selected');
        assert.isVisible(kanban.$('.o_documents_mobile_inspector'),
            "inspector should be opened");

        // close inspector
        await dom.click(kanban.$('.o_documents_close_inspector'));
        assert.containsOnce(kanban, '.o_kanban_record.o_record_selected:not(.o_kanban_ghost)',
            "should still have 1 record selected after closing inspector");

        kanban.destroy();
    });
});

});
