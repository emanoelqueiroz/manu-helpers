(() => {

    const $ = document.querySelector.bind(document);
    const $sql = $('#sql');
    const $tableName = $('#table-name');
    const $buttonGenerateSql = $('#generate-sql');
    const $buttonCreateColumn = $('#create-column');
    const codeFlask = new CodeFlask($('#obj'), { language: 'js' });

    codeFlask.updateCode(JSON.stringify({
        empresa_id: {
            type: 'Number',
            notNull: true,
            foreign: true
        },
        descricao: 'String'
    }, null, 4));

    $buttonGenerateSql.addEventListener('click', () => {
        const json = eval('(' + codeFlask.getCode() + ')');
        const sqlUtils = new SqlUtils($tableName.value);

        $sql.innerHTML = sqlUtils.create(json);
    });

    $buttonCreateColumn.addEventListener('click', () => {
        const json = eval('(' + codeFlask.getCode() + ')');
        const sqlUtils = new SqlUtils($tableName.value);

        $sql.innerHTML = sqlUtils.newColumn(json);
    });

})();