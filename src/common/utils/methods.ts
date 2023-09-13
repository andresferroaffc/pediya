// Validar si el rol es admin
/*export async function validateAdmin(user: UserInterface) {
  let validate: boolean = false;
  if (JSON.stringify(user.role) === JSON.stringify('ADMIN')) {
    validate = true;
  }
  return validate;
}*/

// Definir orden para la paginación
export function SelectOrderBy(order: string | number) {
  const OrderBy: { [P in keyof any]?: 'ASC' | 'DESC' } = {};
  switch (order) {
    case 'ASC':
      OrderBy[0] = 'ASC';
      break;
    case 'DESC':
      OrderBy[0] = 'DESC';
      break;
    case 1:
      OrderBy[0] = 'ASC';
      break;
    case '-1':
      OrderBy[0] = 'DESC';
      break;
    case 'asc':
      OrderBy[0] = 'ASC';
      break;
    case 'desc':
      OrderBy[0] = 'DESC';
      break;
  }

  return OrderBy;
}
