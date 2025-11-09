// function to safely extract data from Sequelize model instances
export const getModelData = <T = any>(model: any): T => {
  if (!model) return model;
  return model.get({ plain: true }) as T;
};
