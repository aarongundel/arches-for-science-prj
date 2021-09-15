define(['underscore', 'knockout', 'arches', 'utils/report','bindings/datatable'], function(_, ko, arches, reportUtils) {
    return ko.components.register('views/components/reports/scenes/description', {
        viewModel: function(params) {
            var self = this;
            Object.assign(self, reportUtils);

            self.statementTableConfig = {
                ...self.defaultTableConfig,
                columns: Array(7).fill(null)
            };

            self.dataConfig = {
                statement: 'Statement',
            }

            self.cards = Object.assign({}, params.cards);
            self.edit = params.editTile || self.editTile;
            self.delete = params.deleteTile || self.deleteTile;
            self.add = params.addTile || self.addNewTile;
            self.statements = ko.observableArray();
            self.visible = {
                statements: ko.observable(true),
            }
            Object.assign(self.dataConfig, params.dataConfig || {});

            // if params.compiled is set and true, the user has compiled their own data.  Use as is.
            if(params?.compiled){
                self.statements(params.data.statements);
            } else {
                let statementData = params.data()[self.dataConfig.statement];
                
                if(statementData) {
                    if(statementData.length === undefined){
                        statementData = [statementData];
                    } 

                    self.statements(statementData.map(x => {
                        const type = self.getNodeValue(x, "statement_type");
                        const name = self.getNodeValue(x, "statement_name", 'statement_name_content');
                        const statementContent = self.getNodeValue(x, "statement_content")
                        const contentNode = self.getNodeValue(x, "content");
                        const content = contentNode == '--' ? statementContent == '--' ? '--' : statementContent :contentNode;
                        const language = self.getNodeValue(x, "statement_language");
                        const label = self.getNodeValue(x, "statement_label");
                        const source = self.getNodeValue(x, "statement_source");
                        const tileid = x?.['@tile_id'];
                        return { type, content, name, language, label, source, tileid };
                    }));
                }

            } 

        },
        template: { require: 'text!templates/views/components/reports/scenes/description.htm' }
    });
});