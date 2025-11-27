function formattDate(value) {
  const indexDateDelimetter = value.indexOf("T");
  const hasTime = indexDateDelimetter >= 0;
  // Extraer la fecha
  const date = value.slice(0, hasTime ? indexDateDelimetter : value.length).split("-");
  const dateFormatted = `${date[2]}-${date[1]}-${date[0]}${hasTime ? value.slice(indexDateDelimetter) : ''}`;
  return dateFormatted;
}

export default { formattDate };