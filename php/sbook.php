<?php
    require  'config.php';
	
    $query = mysql_query("SELECT book_name, book_intro, book_url, author, finish_date, price, many, business FROM book_msg WHERE book_name like '%{$_POST['bookname']}%'") or die('SQL错误');
	
	$json='';
	
	while(!!$row=mysql_fetch_array($query, MYSQL_ASSOC))
	{
		foreach($row as $key=>$value)
		{
			$row[$key]=urlencode(str_replace("\n","",$value));
		}
		$json.=urldecode(json_encode($row)).',';
	}
	
	echo '['.substr($json,0,strlen($json)-1).']';
	
    mysql_close();
?>