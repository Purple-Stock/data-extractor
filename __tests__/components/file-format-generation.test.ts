// Test for file format generation functions
describe('File Format Generation', () => {
  const mockMatchedData = [
    {
      'Cód. Auxiliar': 'AUX001',
      'Descrição_1': 'Produto Teste 1',
      QUANTIDADE: '10',
      VALORUNIT: '15.50',
      EXTRAINF01: 'Info1',
      EXTRAINF02: '123',
    },
    {
      'Cód. Auxiliar': 'AUX002',
      'Descrição_1': 'Produto Teste 2',
      QUANTIDADE: '5',
      VALORUNIT: '25.00',
      EXTRAINF01: 'Info2',
      EXTRAINF02: '456',
    },
  ]

  const generateEstoqueContent = (data: any[]) => {
    let content = "CODIGO;DESCRIÇÃO;QTDA;VALOR UNIT\n"
    data.forEach((row) => {
      let valorUnit = "0.00"
      if (row.VALORUNIT) {
        const numValue = Number.parseFloat(String(row.VALORUNIT).replace(",", "."))
        if (!isNaN(numValue)) {
          valorUnit = numValue.toFixed(2)
        }
      }
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.QUANTIDADE || "0"};${valorUnit}`
      content += line + "\n"
    })
    return content
  }

  const generateConferenciaContent = (data: any[]) => {
    let content = "CODIGO;DESCRI  O;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"
    data.forEach((row) => {
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.QUANTIDADE || "0"};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
      content += line + "\n"
    })
    return content
  }

  const generateProdutosContent = (data: any[]) => {
    let content = "CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n"
    data.forEach((row) => {
      const line = `${row["Cód. Auxiliar"] || ""};${row["Descrição_1"] || ""};${row.EXTRAINF01 || ""};${row.EXTRAINF02 || ""};0`
      content += line + "\n"
    })
    return content
  }

  describe('Estoque Content Generation', () => {
    it('generates correct header', () => {
      const content = generateEstoqueContent(mockMatchedData)
      expect(content).toMatch(/^CODIGO;DESCRIÇÃO;QTDA;VALOR UNIT\n/)
    })

    it('generates correct data rows', () => {
      const content = generateEstoqueContent(mockMatchedData)
      const lines = content.split('\n')
      
      expect(lines[1]).toBe('AUX001;Produto Teste 1;10;15.50')
      expect(lines[2]).toBe('AUX002;Produto Teste 2;5;25.00')
    })

    it('formats VALORUNIT with 2 decimal places', () => {
      const dataWithDecimal = [
        {
          'Cód. Auxiliar': 'AUX001',
          'Descrição_1': 'Produto Teste 1',
          QUANTIDADE: '10',
          VALORUNIT: '15.5',
        },
      ]
      
      const content = generateEstoqueContent(dataWithDecimal)
      expect(content).toContain('15.50')
    })

    it('handles comma decimal separator', () => {
      const dataWithComma = [
        {
          'Cód. Auxiliar': 'AUX001',
          'Descrição_1': 'Produto Teste 1',
          QUANTIDADE: '10',
          VALORUNIT: '15,50',
        },
      ]
      
      const content = generateEstoqueContent(dataWithComma)
      expect(content).toContain('15.50')
    })

    it('handles invalid VALORUNIT values', () => {
      const dataWithInvalid = [
        {
          'Cód. Auxiliar': 'AUX001',
          'Descrição_1': 'Produto Teste 1',
          QUANTIDADE: '10',
          VALORUNIT: 'invalid',
        },
      ]
      
      const content = generateEstoqueContent(dataWithInvalid)
      expect(content).toContain('0.00')
    })

    it('handles empty VALORUNIT', () => {
      const dataWithEmpty = [
        {
          'Cód. Auxiliar': 'AUX001',
          'Descrição_1': 'Produto Teste 1',
          QUANTIDADE: '10',
          VALORUNIT: '',
        },
      ]
      
      const content = generateEstoqueContent(dataWithEmpty)
      expect(content).toContain('0.00')
    })

    it('handles empty data array', () => {
      const content = generateEstoqueContent([])
      expect(content).toBe("CODIGO;DESCRIÇÃO;QTDA;VALOR UNIT\n")
    })
  })

  describe('Conferencia Content Generation', () => {
    it('generates correct header with spaces', () => {
      const content = generateConferenciaContent(mockMatchedData)
      expect(content).toMatch(/^CODIGO;DESCRI  O;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n/)
    })

    it('generates correct data rows', () => {
      const content = generateConferenciaContent(mockMatchedData)
      const lines = content.split('\n')
      
      expect(lines[1]).toBe('AUX001;Produto Teste 1;10;Info1;123;0')
      expect(lines[2]).toBe('AUX002;Produto Teste 2;5;Info2;456;0')
    })

    it('always sets REQEXTRADATA to 0', () => {
      const content = generateConferenciaContent(mockMatchedData)
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        if (index > 0 && line) { // Skip header and empty lines
          const fields = line.split(';')
          expect(fields[5]).toBe('0') // REQEXTRADATA is the 6th field
        }
      })
    })

    it('handles empty data array', () => {
      const content = generateConferenciaContent([])
      expect(content).toBe("CODIGO;DESCRI  O;QTDA;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n")
    })
  })

  describe('Produtos Content Generation', () => {
    it('generates correct header', () => {
      const content = generateProdutosContent(mockMatchedData)
      expect(content).toMatch(/^CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n/)
    })

    it('generates correct data rows', () => {
      const content = generateProdutosContent(mockMatchedData)
      const lines = content.split('\n')
      
      expect(lines[1]).toBe('AUX001;Produto Teste 1;Info1;123;0')
      expect(lines[2]).toBe('AUX002;Produto Teste 2;Info2;456;0')
    })

    it('always sets REQEXTRADATA to 0', () => {
      const content = generateProdutosContent(mockMatchedData)
      const lines = content.split('\n')
      
      lines.forEach((line, index) => {
        if (index > 0 && line) { // Skip header and empty lines
          const fields = line.split(';')
          expect(fields[4]).toBe('0') // REQEXTRADATA is the 5th field
        }
      })
    })

    it('handles empty data array', () => {
      const content = generateProdutosContent([])
      expect(content).toBe("CODE;DESCRIPTION;EXTRAINF01;EXTRAINF02;REQEXTRADATA\n")
    })
  })

  describe('Edge Cases', () => {
    it('handles null and undefined values', () => {
      const dataWithNulls = [
        {
          'Cód. Auxiliar': null,
          'Descrição_1': undefined,
          QUANTIDADE: null,
          VALORUNIT: undefined,
          EXTRAINF01: null,
          EXTRAINF02: undefined,
        },
      ]
      
      const estoqueContent = generateEstoqueContent(dataWithNulls)
      const conferenciaContent = generateConferenciaContent(dataWithNulls)
      const produtosContent = generateProdutosContent(dataWithNulls)
      
      expect(estoqueContent).toContain(';;0;0.00')
      expect(conferenciaContent).toContain(';;0;;;0')
      expect(produtosContent).toContain(';;;0')
    })

    it('handles special characters in descriptions', () => {
      const dataWithSpecialChars = [
        {
          'Cód. Auxiliar': 'AUX001',
          'Descrição_1': 'Produto com "aspas" e ; ponto e vírgula',
          QUANTIDADE: '10',
          VALORUNIT: '15.50',
          EXTRAINF01: 'Info1',
          EXTRAINF02: '123',
        },
      ]
      
      const content = generateEstoqueContent(dataWithSpecialChars)
      expect(content).toContain('Produto com "aspas" e ; ponto e vírgula')
    })

    it('handles very long descriptions', () => {
      const longDescription = 'A'.repeat(1000)
      const dataWithLongDesc = [
        {
          'Cód. Auxiliar': 'AUX001',
          'Descrição_1': longDescription,
          QUANTIDADE: '10',
          VALORUNIT: '15.50',
          EXTRAINF01: 'Info1',
          EXTRAINF02: '123',
        },
      ]
      
      const content = generateEstoqueContent(dataWithLongDesc)
      expect(content).toContain(longDescription)
    })
  })
})
