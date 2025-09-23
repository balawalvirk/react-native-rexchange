import { isNewOrExcellent } from '../src/functions';

describe('rexchange firebase functions', () => {
  it('should give new or excellent properties', () => {
    expect(
      isNewOrExcellent({
        xf_propertycondition: ['New'],
      }),
    ).toBe(true);
    expect(
      isNewOrExcellent({
        xf_propertycondition: ['new'],
      }),
    ).toBe(true);
    expect(
      isNewOrExcellent({
        xf_propertycondition: ['excellent'],
      }),
    ).toBe(true);
    expect(
      isNewOrExcellent({
        xf_propertycondition: ['Excellent'],
      }),
    ).toBe(true);
    expect(
      isNewOrExcellent({
        xf_propertycondition: ['very good'],
      }),
    ).toBe(true);
    expect(
      isNewOrExcellent({
        xf_propertycondition: ['Very Good'],
      }),
    ).toBe(true);
    expect(
      isNewOrExcellent({
        xf_propertycondition: [''],
      }),
    ).toBe(false);
    expect(
      isNewOrExcellent({
        xf_propertycondition: [],
      }),
    ).toBe(false);
    expect(isNewOrExcellent({})).toBe(false);
    expect(
      isNewOrExcellent({
        xf_propertycondition: null,
      }),
    ).toBe(false);
    expect(
      isNewOrExcellent({
        xf_propertycondition: undefined,
      }),
    ).toBe(false);
    expect(isNewOrExcellent(null)).toBe(false);
  });
});
