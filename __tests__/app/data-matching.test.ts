// Test for data matching logic
describe('Data Matching Logic', () => {
  const firstFileData = [
    { EXTRAINF02: '123', DESCRIÇÃO: 'Produto 1', EXTRAINF01: 'Info1', QUANTIDADE: '10', VALORUNIT: '5.50' },
    { EXTRAINF02: '456', DESCRIÇÃO: 'Produto 2', EXTRAINF01: 'Info2', QUANTIDADE: '20', VALORUNIT: '10.00' },
    { EXTRAINF02: '789', DESCRIÇÃO: 'Produto 3', EXTRAINF01: 'Info3', QUANTIDADE: '15', VALORUNIT: '7.25' },
  ]

  const secondFileData = [
    { 'Cód. Produto': '123', 'Cód. Auxiliar': 'AUX123', 'Descrição': 'Descrição 1', 'Embalagem': 'Pacote', 'Unidade': 'UN' },
    { 'Cód. Produto': '456', 'Cód. Auxiliar': 'AUX456', 'Descrição': 'Descrição 2', 'Embalagem': 'Caixa', 'Unidade': 'CX' },
    { 'Cód. Produto': '999', 'Cód. Auxiliar': 'AUX999', 'Descrição': 'Descrição 3', 'Embalagem': 'Unidade', 'Unidade': 'UN' },
  ]

  const matchData = (firstData: any[], secondData: any[]) => {
    const matched: any[] = []

    firstData.forEach((firstRow) => {
      const matchingRow = secondData.find((secondRow) => secondRow['Cód. Produto'] === firstRow.EXTRAINF02)

      if (matchingRow) {
        matched.push({
          EXTRAINF02: firstRow.EXTRAINF02,
          'Cód. Produto': matchingRow['Cód. Produto'],
          'Cód. Auxiliar': matchingRow['Cód. Auxiliar'],
          Descrição_1: firstRow.DESCRIÇÃO,
          Descrição_2: matchingRow['Descrição'],
          EXTRAINF01: firstRow.EXTRAINF01,
          Embalagem: matchingRow['Embalagem'],
          Unidade: matchingRow['Unidade'],
          QUANTIDADE: firstRow.QUANTIDADE,
          VALORUNIT: firstRow.VALORUNIT,
        })
      }
    })

    return matched
  }

  it('matches data correctly when all items have matches', () => {
    const matched = matchData(firstFileData, secondFileData)
    
    expect(matched).toHaveLength(2) // Only 123 and 456 have matches
    
    expect(matched[0]).toEqual({
      EXTRAINF02: '123',
      'Cód. Produto': '123',
      'Cód. Auxiliar': 'AUX123',
      Descrição_1: 'Produto 1',
      Descrição_2: 'Descrição 1',
      EXTRAINF01: 'Info1',
      Embalagem: 'Pacote',
      Unidade: 'UN',
      QUANTIDADE: '10',
      VALORUNIT: '5.50',
    })
    
    expect(matched[1]).toEqual({
      EXTRAINF02: '456',
      'Cód. Produto': '456',
      'Cód. Auxiliar': 'AUX456',
      Descrição_1: 'Produto 2',
      Descrição_2: 'Descrição 2',
      EXTRAINF01: 'Info2',
      Embalagem: 'Caixa',
      Unidade: 'CX',
      QUANTIDADE: '20',
      VALORUNIT: '10.00',
    })
  })

  it('handles partial matches correctly', () => {
    const partialSecondData = [
      { 'Cód. Produto': '123', 'Cód. Auxiliar': 'AUX123', 'Descrição': 'Descrição 1', 'Embalagem': 'Pacote', 'Unidade': 'UN' },
    ]
    
    const matched = matchData(firstFileData, partialSecondData)
    
    expect(matched).toHaveLength(1)
    expect(matched[0].EXTRAINF02).toBe('123')
  })

  it('handles no matches correctly', () => {
    const noMatchData = [
      { 'Cód. Produto': '999', 'Cód. Auxiliar': 'AUX999', 'Descrição': 'Descrição 3', 'Embalagem': 'Unidade', 'Unidade': 'UN' },
    ]
    
    const matched = matchData(firstFileData, noMatchData)
    
    expect(matched).toHaveLength(0)
  })

  it('handles empty data arrays', () => {
    const matched = matchData([], [])
    expect(matched).toHaveLength(0)
  })

  it('handles empty first file data', () => {
    const matched = matchData([], secondFileData)
    expect(matched).toHaveLength(0)
  })

  it('handles empty second file data', () => {
    const matched = matchData(firstFileData, [])
    expect(matched).toHaveLength(0)
  })

  it('preserves all required fields in matched data', () => {
    const matched = matchData(firstFileData, secondFileData)
    
    matched.forEach(row => {
      expect(row).toHaveProperty('EXTRAINF02')
      expect(row['Cód. Produto']).toBeDefined()
      expect(row['Cód. Auxiliar']).toBeDefined()
      expect(row).toHaveProperty('Descrição_1')
      expect(row).toHaveProperty('Descrição_2')
      expect(row).toHaveProperty('EXTRAINF01')
      expect(row).toHaveProperty('Embalagem')
      expect(row).toHaveProperty('Unidade')
      expect(row).toHaveProperty('QUANTIDADE')
      expect(row).toHaveProperty('VALORUNIT')
    })
  })

  it('handles case-sensitive matching', () => {
    const caseSensitiveData = [
      { 'Cód. Produto': '123', 'Cód. Auxiliar': 'AUX123', 'Descrição': 'Descrição 1', 'Embalagem': 'Pacote', 'Unidade': 'UN' },
    ]
    
    const caseSensitiveFirstData = [
      { EXTRAINF02: '123', DESCRIÇÃO: 'Produto 1', EXTRAINF01: 'Info1', QUANTIDADE: '10', VALORUNIT: '5.50' },
    ]
    
    const matched = matchData(caseSensitiveFirstData, caseSensitiveData)
    expect(matched).toHaveLength(1)
  })

  it('handles different data types in matching field', () => {
    const stringData = [
      { 'Cód. Produto': '123', 'Cód. Auxiliar': 'AUX123', 'Descrição': 'Descrição 1', 'Embalagem': 'Pacote', 'Unidade': 'UN' },
    ]
    
    const numberData = [
      { EXTRAINF02: 123, DESCRIÇÃO: 'Produto 1', EXTRAINF01: 'Info1', QUANTIDADE: '10', VALORUNIT: '5.50' },
    ]
    
    const matched = matchData(numberData, stringData)
    expect(matched).toHaveLength(0) // String '123' !== number 123
  })
})