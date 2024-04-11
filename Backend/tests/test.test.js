describe('createInjury', () => {
  test('Successfully creates an injury', async () => {
    const injuryData = {
      type: 'fracture',
      description: 'Broken leg',
      severity: 'high',
      date: new Date(),
      location: 'Hospital A',
      citizenId: '1234567890'
    };

    const newInjury = await DAO.getInstance().createInjury(injuryData);
    expect(newInjury).toBeDefined();
    expect(newInjury.type).toBe(injuryData.type);
    expect(newInjury.description).toBe(injuryData.description);
    expect(newInjury.severity).toBe(injuryData.severity);
    expect(newInjury.date).toEqual(injuryData.date);
    expect(newInjury.location).toBe(injuryData.location);
    expect(newInjury.citizenId).toBe(injuryData.citizenId);
  });

  test('Throws an error when required fields are missing', async () => {
    const injuryData = {
      type: 'fracture',
      severity: 'high',
      date: new Date(),
      location: 'Hospital A',
      citizenId: '1234567890'
    };

    await expect(DAO.getInstance().createInjury(injuryData)).rejects.toThrow();
  });
});