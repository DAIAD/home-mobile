$(function() {
  
  lineFit = function(points){
  sI = slopeAndIntercept(points);
  if (sI){
  var N = points.length;
  var rV = [];
  rV.push([points[0][0], sI.slope * points[0][0] + sI.intercept]);
  rV.push([points[N-1][0], sI.slope * points[N-1][0] + sI.intercept]);
  return rV;
  }
  return [];
  }
  
  slopeAndIntercept = function(points){
  var rV = {},
  N = points.length,
  sumX = 0,
  sumY = 0,
  sumXx = 0,
  sumYy = 0,
  sumXy = 0;
  
  if (N < 2){
  return rV;
  }
  
  for (var i = 0; i < N; i++){
  var x = points[i][0],
  y = points[i][1];
  sumX += x;
  sumY += y;
  sumXx += (x*x);
  sumYy += (y*y);
  sumXy += (x*y);
  }
  rV['slope'] = ((N * sumXy) - (sumX * sumY)) / (N * sumXx - (sumX*sumX));
  rV['intercept'] = (sumY - rV['slope'] * sumX) / N;
  rV['rSquared'] = Math.abs((rV['slope'] * (sumXy - (sumX * sumY) / N)) / (sumYy - ((sumY * sumY) / N)));
  
  return rV;
  }

});